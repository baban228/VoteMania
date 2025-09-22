from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('user', '0002_friendship_friendrequest'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserActivity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activity_type', models.CharField(choices=[('voting_created', 'Создал(а) голосование'), ('voting_ended', 'Голосование завершено'), ('voted', 'Проголосовал(а)'), ('friend_added', 'Добавил(а) в друзья'), ('friend_request', 'Отправил(а) запрос в друзья'), ('voting_invitation', 'Получил(а) приглашение на голосование')], max_length=20)),
                ('description', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('object_id', models.PositiveIntegerField(blank=True, null=True)),
                ('content_type', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='contenttypes.contenttype')),
                ('target_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='targeted_activities', to='user.user')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='user.user')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]