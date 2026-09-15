from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        CASHIER = "cashier", "Cashier"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    role = models.CharField(max_length=20, choices=Role.choices, default="cashier")
    status = models.CharField(max_length=20, choices=Status.choices, default="active")

    class Meta:
        db_table = "accounts_user"

    @property
    def display_name(self):
        full = self.get_full_name()
        return full if full else self.username

    def __str__(self):
        return f"{self.display_name} ({self.get_role_display()})"
