from django.urls import path

from . import views

app_name = "api"

urlpatterns = [
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/refresh/", views.TokenRefreshView.as_view(), name="token_refresh"),
    path("users/", views.UserListView.as_view(), name="user_list"),
    path("users/me/", views.CurrentUserView.as_view(), name="current_user"),
]
