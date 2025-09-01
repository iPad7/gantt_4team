from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    CSRF 검증을 수행하지 않는 세션 인증 클래스입니다.
    API 호출 시 CSRF 문제를 해결하기 위해 사용됩니다.
    """
    def enforce_csrf(self, request):
        return  # CSRF 검증을 건너뜁니다.
