from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Allow access only to admin users and superusers."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_superuser)
        )


class IsCashier(permissions.BasePermission):
    """Allow access only to cashier users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "cashier"
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read access to any authenticated user, write access to admins and superusers only."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_superuser)
        )
