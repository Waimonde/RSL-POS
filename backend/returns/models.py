from django.db import models


class Return(models.Model):

    class Reason(models.TextChoices):
        DEFECTIVE = "defective", "Defective"
        WRONG_ITEM = "wrong_item", "Wrong Item"
        CHANGED_MIND = "changed_mind", "Changed Mind"
        OTHER = "other", "Other"

    sale = models.ForeignKey(
        "sales.Sale", on_delete=models.CASCADE, related_name="returns"
    )
    cashier = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="returns"
    )
    reason = models.CharField(max_length=20, choices=Reason.choices)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "returns_return"
        ordering = ("-timestamp",)

    def __str__(self):
        return f"Return #{self.id} for Sale #{self.sale_id}"


class ReturnItem(models.Model):
    return_order = models.ForeignKey(
        Return, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        "inventory.Product", on_delete=models.CASCADE, related_name="return_items"
    )
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "returns_returnitem"

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"
