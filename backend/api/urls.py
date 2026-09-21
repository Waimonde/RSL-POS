from django.urls import path

from . import views

app_name = "api"

urlpatterns = [
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/refresh/", views.TokenRefreshView.as_view(), name="token_refresh"),
    path("users/", views.UserListView.as_view(), name="user_list"),
    path("users/me/", views.CurrentUserView.as_view(), name="current_user"),
    path("users/change-password/", views.ChangePasswordView.as_view(), name="change_password"),
    # Categories
    path("categories/", views.CategoryListView.as_view(), name="category_list"),
    path("categories/create/", views.CategoryCreateView.as_view(), name="category_create"),
    path("categories/<int:pk>/", views.CategoryDetailView.as_view(), name="category_detail"),
    # Products
    path("products/", views.ProductListView.as_view(), name="product_list"),
    path("products/create/", views.ProductCreateView.as_view(), name="product_create"),
    path("products/<int:pk>/", views.ProductDetailView.as_view(), name="product_detail"),
    # Stock
    path("stock-movements/", views.StockMovementListView.as_view(), name="stock_movement_list"),
    path("stock-receive/", views.StockReceiveView.as_view(), name="stock_receive"),
]
