from django.apps import AppConfig


class WbsAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'wbs_app'

    def ready(self):
        import wbs_app.signals
    verbose_name = 'WBS 관리 시스템'
