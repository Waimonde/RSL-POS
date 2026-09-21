import re
from django.contrib.auth import authenticate
from rest_framework import serializers

from accounts.models import User


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        if user.status == "inactive":
            raise serializers.ValidationError("Account is inactive.")
        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "display_name", "email", "role", "status", "date_joined")
        read_only_fields = ("id", "username", "display_name", "role", "status", "date_joined")


class UserListSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "display_name", "role", "status", "date_joined")
        read_only_fields = ("id", "display_name", "date_joined")


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        new_pwd = attrs["new_password"]
        confirm_pwd = attrs["confirm_password"]

        if new_pwd != confirm_pwd:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})
        if len(new_pwd) < 8:
            raise serializers.ValidationError({"new_password": "Password must be at least 8 characters long."})
        if not re.search(r"\d", new_pwd):
            raise serializers.ValidationError({"new_password": "Password must contain at least one number."})
        if not re.search(r"[^A-Za-z0-9]", new_pwd):
            raise serializers.ValidationError({"new_password": "Password must contain at least one special character (e.g. !@#$%^&*)." })
        return attrs

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
