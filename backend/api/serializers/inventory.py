from rest_framework import serializers

from inventory.models import Category, Product, StockMovement


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "description")
        read_only_fields = ("id",)


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "category",
            "category_name",
            "name",
            "sku",
            "barcode",
            "buying_price",
            "selling_price",
            "quantity",
            "reorder_level",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "sku",
            "barcode",
            "category",
            "category_name",
            "buying_price",
            "selling_price",
            "quantity",
            "reorder_level",
            "status",
        )
        read_only_fields = ("id",)


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    user_name = serializers.CharField(source="user.display_name", read_only=True)

    class Meta:
        model = StockMovement
        fields = ("id", "product", "product_name", "movement_type", "quantity", "reference", "user", "user_name", "created_at")
        read_only_fields = ("id", "user", "user_name", "created_at")


class StockReceiveSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    reference = serializers.CharField(max_length=200)

    def validate_product(self, value):
        if value.status != Product.Status.ACTIVE:
            raise serializers.ValidationError("Cannot receive stock for an inactive product.")
        return value
