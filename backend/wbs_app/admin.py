from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Task, TaskComment


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """사용자 관리자 설정"""
    list_display = ['username', 'name', 'email', 'is_admin', 'is_active', 'date_joined']
    list_filter = ['is_admin', 'is_active', 'date_joined']
    search_fields = ['username', 'name', 'email']
    ordering = ['username']
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('개인 정보', {'fields': ('name', 'email', 'first_name', 'last_name')}),
        ('권한', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_admin', 'groups', 'user_permissions')}),
        ('중요한 날짜', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'name', 'password1', 'password2', 'is_admin'),
        }),
    )


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """작업 관리자 설정"""
    list_display = ['title', 'parent_task', 'status', 'progress', 'start_date', 'end_date', 'display_assignees', 'created_by']
    list_filter = ['status', 'parent_task', 'assigned_to', 'created_by', 'start_date', 'end_date']
    search_fields = ['title', 'description']
    ordering = ['start_date', 'title']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('기본 정보', {'fields': ('title', 'description', 'parent_task')}),
        ('일정', {'fields': ('start_date', 'end_date')}),
        ('진행 상황', {'fields': ('status', 'progress')}),
        ('담당자', {'fields': ('assigned_to', 'created_by')}),
        ('시스템', {'fields': ('color', 'created_at', 'updated_at')}),
    )
    
    readonly_fields = ['color', 'created_at', 'updated_at']
    
    def get_queryset(self, request):
        """쿼리셋 최적화"""
        return super().get_queryset(request).select_related('parent_task', 'created_by').prefetch_related('assigned_to')

    def display_assignees(self, obj):
        """담당자 목록을 문자열로 반환"""
        return ", ".join([user.name for user in obj.assigned_to.all()])
    display_assignees.short_description = '담당자'



@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    """작업 댓글 관리자 설정"""
    list_display = ['task', 'author', 'content', 'created_at']
    list_filter = ['author', 'created_at']
    search_fields = ['content', 'task__title', 'author__username']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        """쿼리셋 최적화"""
        return super().get_queryset(request).select_related('task', 'author')
