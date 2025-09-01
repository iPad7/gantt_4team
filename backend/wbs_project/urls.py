from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def api_info(request):
    """API 정보 페이지"""
    return JsonResponse({
        'message': 'WBS API 서버가 정상적으로 실행 중입니다.',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'auth': '/api/auth/',
            'tasks': '/api/tasks/',
            'users': '/api/users/',
            'dashboard': '/api/dashboard/',
            'gantt_chart': '/api/gantt-chart/'
        },
        'status': 'running'
    })

urlpatterns = [
    path('', api_info, name='api_info'),  # 루트 경로 추가
    path('admin/', admin.site.urls),
    path('api/', include('wbs_app.urls')),
]

# 개발 환경에서 static/media 파일 서빙
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
