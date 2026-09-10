from django.db import models


class Sale(models.Model):

    class Status(models.TextChoices):
        COMPLETED = "completed", "Completed"
        REFUNDED = "refunded", "Refunded"

    cashier = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="sales"
    )
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.SET_NULL, null=True, blank=True, related_name="sales"
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default="completed")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "sales_sale"
        ordering = ("-timestamp",)

    def __str__(self):
        return f"Sale #{self.id} - {self.total_amount}"


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "inventory.Product", on_delete=models.CASCADE, related_name="sale_items"
    )
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = "sales_saleitem"

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"
