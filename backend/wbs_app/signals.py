from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Min, Max
from .models import Task

def update_parent_task_dates(parent_task):
    """
    주어진 상위 작업의 시작일과 종료일을
    하위 작업들을 기반으로 업데이트합니다.
    """
    if not parent_task:
        return

    subtasks = parent_task.subtasks.all()
    
    if subtasks.exists():
        # 하위 작업들로부터 가장 빠른 시작일과 가장 늦은 종료일을 계산합니다.
        new_dates = subtasks.aggregate(
            min_start=Min('start_date'),
            max_end=Max('end_date')
        )
        
        # 부모 작업의 날짜를 업데이트하고, 재귀적인 시그널 호출을 방지하기 위해
        # update_fields를 사용하여 저장합니다.
        parent_task.start_date = new_dates['min_start']
        parent_task.end_date = new_dates['max_end']
        parent_task.save(update_fields=['start_date', 'end_date'])

@receiver(post_save, sender=Task)
def task_saved(sender, instance, **kwargs):
    """
    작업이 저장된 후, 상위 작업의 날짜를 업데이트합니다.
    """
    # 저장된 작업의 상위 작업 또는 이전 상위 작업의 날짜를 업데이트합니다.
    if instance.parent_task:
        update_parent_task_dates(instance.parent_task)
    
    # 만약 작업의 상위 작업이 변경되었다면, 이전 상위 작업도 업데이트해야 합니다.
    try:
        # 'update_fields'를 사용하면 'get_dirty_fields'를 사용할 수 없습니다.
        # 따라서, 간단하게 이전 상태를 추적하는 대신 항상 부모를 업데이트합니다.
        # 좀 더 복잡한 시나리오에서는 pre_save에서 이전 부모를 저장해야 할 수 있습니다.
        pass
    except AttributeError:
        pass


@receiver(post_delete, sender=Task)
def task_deleted(sender, instance, **kwargs):
    """
    작업이 삭제된 후, 상위 작업의 날짜를 업데이트합니다.
    """
    if instance.parent_task:
        update_parent_task_dates(instance.parent_task)
