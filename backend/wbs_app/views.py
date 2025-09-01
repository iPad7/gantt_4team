from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from datetime import date, timedelta
import json

from .models import User, Task, TaskComment
from .serializers import (
    UserSerializer, UserCreateSerializer, TaskSerializer, 
    TaskCreateSerializer, TaskUpdateSerializer, TaskCommentSerializer,
    GanttChartSerializer
)


class IsAdminUser(permissions.BasePermission):
    """관리자 전용 권한"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class AuthView(APIView):
    """인증 관련 뷰"""
    permission_classes = [permissions.AllowAny]

    def get_authenticators(self):
        """
        로그인(POST) 요청 시에는 인증을 요구하지 않고,
        상태 확인(GET)이나 로그아웃(DELETE) 시에는 기본 인증을 사용합니다.
        """
        if self.request.method == 'POST':
            return []
        return super().get_authenticators()
    
    def get(self, request):
        """사용자 상태 확인"""
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        else:
            return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)
    
    def post(self, request):
        """로그인"""
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': '사용자명과 비밀번호를 입력해주세요.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        else:
            return Response(
                {'error': '잘못된 사용자명 또는 비밀번호입니다.'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    def delete(self, request):
        """로그아웃"""
        logout(request)
        return Response({'message': '로그아웃되었습니다.'})


class UserViewSet(viewsets.ModelViewSet):
    """사용자 관리 뷰셋"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """
        액션에 따라 권한을 다르게 설정합니다.
        - 목록 조회(list)는 인증된 사용자 누구나 가능합니다.
        - 그 외의 작업(생성, 수정, 삭제)은 관리자만 가능합니다.
        """
        if self.action == 'list':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def list(self, request):
        """사용자 목록 조회"""
        users = User.objects.all().order_by('username')
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        """새 사용자 생성"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskViewSet(viewsets.ModelViewSet):
    """작업 관리 뷰셋"""
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        return TaskSerializer
    
    def perform_create(self, serializer):
        """작업 생성 시 생성자 설정"""
        serializer.save(created_by=self.request.user)
    
    def list(self, request):
        """작업 목록 조회"""
        tasks = Task.objects.all().order_by('start_date', 'title')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def gantt_chart(self, request):
        """간트 차트 데이터 조회"""
        tasks = Task.objects.all()
        serializer = GanttChartSerializer(tasks, many=False)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def parent_tasks(self, request):
        """상위 작업만 조회"""
        parent_tasks = Task.objects.filter(parent_task__isnull=True)
        serializer = self.get_serializer(parent_tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def subtasks(self, request, pk=None):
        """하위 작업 조회"""
        task = self.get_object()
        subtasks = task.subtasks.all()
        serializer = self.get_serializer(subtasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """작업에 댓글 추가"""
        task = self.get_object()
        serializer = TaskCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskCommentViewSet(viewsets.ModelViewSet):
    """작업 댓글 관리 뷰셋"""
    queryset = TaskComment.objects.all()
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """댓글 생성 시 작성자 설정"""
        serializer.save(author=request.user)
    
    def list(self, request):
        """특정 작업의 댓글 조회"""
        task_id = request.query_params.get('task_id')
        if task_id:
            comments = TaskComment.objects.filter(task_id=task_id).order_by('-created_at')
        else:
            comments = TaskComment.objects.all().order_by('-created_at')
        
        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)


class DashboardView(APIView):
    """대시보드 데이터 뷰"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """대시보드 통계 데이터 조회"""
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status='completed').count()
        in_progress_tasks = Task.objects.filter(status='in_progress').count()
        not_started_tasks = Task.objects.filter(status='not_started').count()
        
        # 프로젝트 진행률 계산
        project_progress = 0
        if total_tasks > 0:
            project_progress = (completed_tasks / total_tasks) * 100
        
        # 사용자별 작업 수
        user_task_counts = []
        for user in User.objects.all():
            task_count = Task.objects.filter(assigned_to=user).count()
            user_task_counts.append({
                'user_id': user.id,
                'username': user.username,
                'name': user.name,
                'task_count': task_count
            })
        
        # 최근 작업
        recent_tasks = Task.objects.order_by('-created_at')[:5]
        recent_tasks_data = TaskSerializer(recent_tasks, many=True).data
        
        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'not_started_tasks': not_started_tasks,
            'project_progress': round(project_progress, 1),
            'user_task_counts': user_task_counts,
            'recent_tasks': recent_tasks_data
        })


class ProjectTimelineView(APIView):
    """프로젝트 타임라인 뷰"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """프로젝트 타임라인 데이터 조회"""
        # 프로젝트 기간 설정
        project_start = date(2025, 7, 23)
        project_end = date(2025, 9, 15)
        
        # 업무일 계산 (주말 제외)
        work_days = []
        current_date = project_start
        while current_date <= project_end:
            if current_date.weekday() < 5:  # 월요일(0) ~ 금요일(4)
                work_days.append(current_date.strftime('%Y-%m-%d'))
            current_date += timedelta(days=1)
        
        # 상위 작업별 타임라인
        parent_tasks = Task.objects.filter(parent_task__isnull=True)
        timeline_data = []
        
        for task in parent_tasks:
            timeline_data.append({
                'id': task.id,
                'title': task.title,
                'color': task.color,
                'start_date': task.start_date.strftime('%Y-%m-%d'),
                'end_date': task.effective_end_date.strftime('%Y-%m-%d'),
                'subtasks': [
                    {
                        'id': subtask.id,
                        'title': subtask.title,
                        'start_date': subtask.start_date.strftime('%Y-%m-%d'),
                        'end_date': subtask.end_date.strftime('%Y-%m-%d'),
                        'status': subtask.status,
                        'progress': subtask.progress
                    }
                    for subtask in task.subtasks.all()
                ]
            })
        
        return Response({
            'project_start': project_start.strftime('%Y-%m-%d'),
            'project_end': project_end.strftime('%Y-%m-%d'),
            'work_days': work_days,
            'timeline_data': timeline_data
        })
