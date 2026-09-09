from django.db import models


class Payment(models.Model):

    class PaymentMethod(models.TextChoices):
        CASH = "cash", "Cash"
        MPESA = "mpesa", "M-Pesa"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"

    sale = models.ForeignKey(
        "sales.Sale", on_delete=models.CASCADE, related_name="payments"
    )
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reference_code = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default="pending")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "payments_payment"

    def __str__(self):
        return f"{self.get_payment_method_display()} - {self.amount} ({self.get_status_display()})"
