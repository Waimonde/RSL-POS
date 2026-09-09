from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        CASHIER = "cashier", "Cashier"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    name = models.CharField(max_length=200, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default="cashier")
    status = models.CharField(max_length=20, choices=Status.choices, default="active")

    class Meta:
        db_table = "accounts_user"

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"
