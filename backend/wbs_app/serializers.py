from rest_framework import serializers
from .models import User, Task, TaskComment


class UserSerializer(serializers.ModelSerializer):
    """사용자 시리얼라이저"""
    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'is_admin', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    """사용자 생성 시리얼라이저 (관리자 전용)"""
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'name', 'password', 'is_admin']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            name=validated_data['name'],
            password=validated_data['password'],
            is_admin=validated_data.get('is_admin', False)
        )
        return user


class TaskCommentSerializer(serializers.ModelSerializer):
    """작업 댓글 시리얼라이저"""
    author_name = serializers.CharField(source='author.name', read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'content', 'author', 'author_name', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    """작업 시리얼라이저"""
    subtasks = serializers.SerializerMethodField()
    parent_task_title = serializers.CharField(source='parent_task.title', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    assigned_to_names = serializers.SerializerMethodField()
    comments = TaskCommentSerializer(many=True, read_only=True)
    total_duration = serializers.ReadOnlyField()
    is_parent_task = serializers.ReadOnlyField()
    has_subtasks = serializers.ReadOnlyField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'start_date', 'end_date',
            'parent_task', 'parent_task_title', 'color', 'status', 'progress',
            'created_by', 'created_by_name', 'assigned_to', 'assigned_to_names',
            'created_at', 'updated_at', 'subtasks', 'comments',
            'total_duration', 'is_parent_task', 'has_subtasks'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'color']
    
    def get_subtasks(self, obj):
        """하위 작업들을 재귀적으로 가져오기"""
        subtasks = obj.subtasks.all()
        return TaskSerializer(subtasks, many=True).data

    def get_assigned_to_names(self, obj):
        """담당자 이름 목록을 반환"""
        return [user.name for user in obj.assigned_to.all()]


class TaskCreateSerializer(serializers.ModelSerializer):
    """작업 생성 시리얼라이저"""
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'start_date', 'end_date',
            'parent_task', 'status', 'progress', 'assigned_to'
        ]
    
    def validate(self, data):
        """데이터 유효성 검사"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("시작일은 종료일보다 이전이어야 합니다.")
        
        # 프로젝트 기간 내에 있는지 확인 (7월 23일 ~ 9월 15일)
        from datetime import date
        project_start = date(2025, 7, 23)
        project_end = date(2025, 9, 15)
        
        if start_date and start_date < project_start:
            raise serializers.ValidationError("시작일은 2025년 7월 23일 이후여야 합니다.")
        
        if end_date and end_date > project_end:
            raise serializers.ValidationError("종료일은 2025년 9월 15일 이전이어야 합니다.")
        
        return data


class TaskUpdateSerializer(serializers.ModelSerializer):
    """작업 수정 시리얼라이저"""
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'start_date', 'end_date',
            'parent_task', 'status', 'progress', 'assigned_to'
        ]
    
    def validate(self, data):
        """데이터 유효성 검사"""
        return TaskCreateSerializer.validate(self, data)


class GanttChartSerializer(serializers.Serializer):
    """간트 차트 데이터 시리얼라이저"""
    tasks = TaskSerializer(many=True)
    project_start_date = serializers.DateField()
    project_end_date = serializers.DateField()
    work_days = serializers.ListField(child=serializers.DateField())
    
    def to_representation(self, instance):
        """간트 차트 형식으로 데이터 변환"""
        from datetime import date, timedelta
        
        # 프로젝트 기간 설정
        project_start = date(2025, 7, 23)
        project_end = date(2025, 9, 15)
        
        # 업무일 계산 (주말 제외)
        work_days = []
        current_date = project_start
        while current_date <= project_end:
            if current_date.weekday() < 5:  # 월요일(0) ~ 금요일(4)
                work_days.append(current_date)
            current_date += timedelta(days=1)
        
        # 상위 작업만 필터링
        parent_tasks = instance.filter(parent_task__isnull=True)
        
        return {
            'tasks': TaskSerializer(parent_tasks, many=True).data,
            'project_start_date': project_start,
            'project_end_date': project_end,
            'work_days': work_days
        }
