from django.db import models


class Supplier(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "suppliers_supplier"

    def __str__(self):
        return self.name


class Purchase(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        RECEIVED = "received", "Received"
        CANCELLED = "cancelled", "Cancelled"

    supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL, null=True, related_name="purchases"
    )
    user = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="purchases"
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default="pending")
    date_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "suppliers_purchase"
        ordering = ("-date_time",)

    def __str__(self):
        return f"Purchase #{self.id} from {self.supplier}"


class PurchaseItem(models.Model):
    purchase = models.ForeignKey(
        Purchase, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        "inventory.Product", on_delete=models.CASCADE, related_name="purchase_items"
    )
    quantity = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "suppliers_purchaseitem"

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"
