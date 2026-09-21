from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User
from inventory.models import Category, Product, StockMovement

from .permissions import IsAdmin, IsAdminOrReadOnly
from .serializers import (
    CategorySerializer,
    ChangePasswordSerializer,
    LoginSerializer,
    ProductListSerializer,
    ProductSerializer,
    StockMovementSerializer,
    StockReceiveSerializer,
    UserListSerializer,
    UserSerializer,
)


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class TokenRefreshView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            refresh = RefreshToken(refresh_token)
            return Response(
                {"access": str(refresh.access_token)},
                status=status.HTTP_200_OK,
            )
        except (InvalidToken, TokenError):
            return Response(
                {"error": "Invalid refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class UserListView(generics.ListAPIView):
    permission_classes = (IsAdmin,)
    serializer_class = UserListSerializer
    queryset = User.objects.all().order_by("-date_joined")


class CurrentUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)


# --- Category Views ---


class CategoryListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CategorySerializer
    queryset = Category.objects.all().order_by("name")


class CategoryCreateView(generics.CreateAPIView):
    permission_classes = (IsAdmin,)
    serializer_class = CategorySerializer


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAdminOrReadOnly,)
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


# --- Product Views ---


class ProductListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ProductListSerializer

    def get_queryset(self):
        queryset = Product.objects.select_related("category").order_by("-created_at")
        search = self.request.query_params.get("search")
        category = self.request.query_params.get("category")
        product_status = self.request.query_params.get("status")
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(sku__icontains=search)
        if category:
            queryset = queryset.filter(category_id=category)
        if product_status:
            queryset = queryset.filter(status=product_status)
        else:
            queryset = queryset.filter(status=Product.Status.ACTIVE)
        return queryset


class ProductCreateView(generics.CreateAPIView):
    permission_classes = (IsAdmin,)
    serializer_class = ProductSerializer


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAdmin,)
    serializer_class = ProductSerializer
    queryset = Product.objects.select_related("category").all()

    def perform_destroy(self, instance):
        instance.status = Product.Status.INACTIVE
        instance.save()


# --- Stock Views ---


class StockMovementListView(generics.ListAPIView):
    permission_classes = (IsAdmin,)
    serializer_class = StockMovementSerializer

    def get_queryset(self):
        queryset = StockMovement.objects.select_related("product", "user").order_by("-created_at")
        product = self.request.query_params.get("product")
        if product:
            queryset = queryset.filter(product_id=product)
        return queryset


class StockReceiveView(APIView):
    permission_classes = (IsAdmin,)

    def post(self, request):
        serializer = StockReceiveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]
        reference = serializer.validated_data["reference"]

        product.quantity += quantity
        product.save()

        movement = StockMovement.objects.create(
            product=product,
            movement_type=StockMovement.MovementType.IN,
            quantity=quantity,
            reference=reference,
            user=request.user,
        )

        return Response(
            StockMovementSerializer(movement).data,
            status=status.HTTP_201_CREATED,
        )
