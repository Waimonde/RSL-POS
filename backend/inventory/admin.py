from django.contrib import admin

from .models import Category, Product, StockMovement


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "category", "buying_price", "selling_price", "quantity", "reorder_level", "status")
    list_filter = ("status", "category")
    search_fields = ("name", "sku", "barcode")
    readonly_fields = ("created_at", "updated_at")


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ("product", "movement_type", "quantity", "reference", "user", "created_at")
    list_filter = ("movement_type",)
    search_fields = ("product__name", "reference")
    readonly_fields = ("created_at",)
