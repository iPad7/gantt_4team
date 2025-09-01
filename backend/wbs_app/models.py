from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import random


class User(AbstractUser):
    """사용자 모델"""
    name = models.CharField(max_length=100, verbose_name='실명')
    is_admin = models.BooleanField(default=False, verbose_name='관리자 여부')
    
    # related_name 추가로 충돌 해결
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='wbs_user_set',
        related_query_name='wbs_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='wbs_user_set',
        related_query_name='wbs_user',
    )
    
    class Meta:
        verbose_name = '사용자'
        verbose_name_plural = '사용자들'
    
    def __str__(self):
        return f"{self.username} ({self.name})"


class Task(models.Model):
    """작업 모델"""
    TASK_STATUS_CHOICES = [
        ('not_started', '시작 전'),
        ('in_progress', '진행 중'),
        ('completed', '완료'),
        ('on_hold', '보류'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='작업 제목')
    description = models.TextField(blank=True, verbose_name='작업 설명')
    start_date = models.DateField(verbose_name='시작일')
    end_date = models.DateField(verbose_name='종료일')
    parent_task = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='subtasks',
        verbose_name='상위 작업'
    )
    color = models.CharField(max_length=7, default='#', verbose_name='색상 코드')
    status = models.CharField(
        max_length=20, 
        choices=TASK_STATUS_CHOICES, 
        default='not_started',
        verbose_name='작업 상태'
    )
    progress = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='진행률 (%)'
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_tasks',
        verbose_name='생성자'
    )
    assigned_to = models.ManyToManyField(
        User,
        blank=True,
        related_name='assigned_tasks',
        verbose_name='담당자'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '작업'
        verbose_name_plural = '작업들'
        ordering = ['start_date', 'title']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # 상위 작업이 없고 색상이 기본값인 경우 랜덤 색상 할당
        if not self.parent_task and self.color == '#':
            self.color = self.generate_random_color()
        super().save(*args, **kwargs)
    
    def generate_random_color(self):
        """랜덤한 파스텔 색상 생성"""
        colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
            '#A9CCE3', '#F9E79F', '#D5A6BD', '#A3E4D7', '#FAD7A0'
        ]
        return random.choice(colors)
    
    @property
    def is_parent_task(self):
        """상위 작업인지 확인"""
        return self.parent_task is None
    
    @property
    def has_subtasks(self):
        """하위 작업이 있는지 확인"""
        return self.subtasks.exists()
    
    @property
    def total_duration(self):
        """작업 기간 계산 (주말 제외)"""
        from datetime import timedelta
        current_date = self.start_date
        end_date = self.end_date
        work_days = 0
        
        while current_date <= end_date:
            if current_date.weekday() < 5:  # 월요일(0) ~ 금요일(4)
                work_days += 1
            current_date += timedelta(days=1)
        
        return work_days
    
    @property
    def effective_end_date(self):
        """상위 작업의 경우 하위 작업들의 최대 종료일 반환"""
        if self.is_parent_task and self.has_subtasks:
            max_end_date = max(subtask.end_date for subtask in self.subtasks.all())
            return max_end_date
        return self.end_date


class TaskComment(models.Model):
    """작업 댓글 모델"""
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name='comments',
        verbose_name='작업'
    )
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='task_comments',
        verbose_name='작성자'
    )
    content = models.TextField(verbose_name='댓글 내용')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='작성일')
    
    class Meta:
        verbose_name = '작업 댓글'
        verbose_name_plural = '작업 댓글들'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.author.username}의 댓글 - {self.task.title}"