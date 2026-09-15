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
        fields = ("id", "username", "first_name", "last_name", "display_name", "email", "role", "status")
        read_only_fields = ("id", "display_name")


class UserListSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "display_name", "role", "status")
        read_only_fields = ("id", "display_name")
