from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'tasks', views.TaskViewSet)
router.register(r'comments', views.TaskCommentViewSet)

urlpatterns = [
    # 인증
    path('auth/status/', views.AuthView.as_view(), name='auth_status'),
    path('auth/login/', views.AuthView.as_view(), name='auth_login'),
    path('auth/logout/', views.AuthView.as_view(), name='auth_logout'),
    
    # 대시보드
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    
    # 프로젝트 타임라인
    path('timeline/', views.ProjectTimelineView.as_view(), name='timeline'),
    
    # 라우터 URL들
    path('', include(router.urls)),
]
