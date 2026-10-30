"""
Manual account recovery, until there's an email server to send reset links.

Runs directly against the database in DATABASE_URL — never exposed over HTTP.
To act on production, point DATABASE_URL at Neon for the duration of the
command (e.g. a shell-level override), not by editing .env.

Usage (from backend/app):
    uv run python src/admin.py find <text>
    uv run python src/admin.py reset-password <username> [--prompt]
"""
import argparse
import getpass
import secrets
import sys

from sqlalchemy import or_
from sqlalchemy.orm import Session
from database import SessionLocal
from security import hash_password
import models


def find_users(db: Session, query: str) -> list[models.User]:
    """Partial, case-insensitive match on username, email or first/last name."""
    pattern = f"%{query.strip()}%"

    return (
        db.query(models.User)
        .outerjoin(models.UserInfo, models.UserInfo.user_id == models.User.id)
        .outerjoin(models.Patient, models.Patient.user_id == models.User.id)
        .filter(or_(
            models.User.username.ilike(pattern),
            models.User.email.ilike(pattern),
            models.UserInfo.first_name.ilike(pattern),
            models.UserInfo.last_name.ilike(pattern),
            models.Patient.first_name.ilike(pattern),
            models.Patient.last_name.ilike(pattern),
        ))
        .order_by(models.User.id)
        .all()
    )


def reset_password(db: Session, username: str, new_password: str | None = None) -> str | None:
    """
    Sets a new password for the user. Generates a temporary one when none is
    given. Returns the password that was set, or None if the user doesn't exist.
    """
    clean_username = username.strip().lower()

    user = db.query(models.User).filter(
        models.User.username == clean_username
    ).first()

    if user is None:
        return None

    if new_password is None:
        # ~12 URL-safe chars: easy to read out over the phone, hard to guess
        new_password = secrets.token_urlsafe(9)

    user.password = hash_password(new_password)
    db.commit()

    return new_password


def print_users(users: list[models.User]) -> None:
    for user in users:
        info = user.staff_info or user.patient_profile
        name = f"{info.first_name} {info.last_name}" if info else "-"
        print(f"[{user.id}] {user.username} <{user.email}> {user.role.value} — {name}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Manual account recovery.")
    commands = parser.add_subparsers(dest="command", required=True)

    find_cmd = commands.add_parser("find", help="Look up users by username, email or name")
    find_cmd.add_argument("query")

    reset_cmd = commands.add_parser("reset-password", help="Set a new password for a user")
    reset_cmd.add_argument("username")
    reset_cmd.add_argument("--prompt", action="store_true",
                           help="Type the new password instead of generating one")

    args = parser.parse_args()

    with SessionLocal() as db:
        if args.command == "find":
            users = find_users(db, args.query)
            if not users:
                print(f"No users match '{args.query}'.")
            print_users(users)
            return

        typed_password = None
        if args.prompt:
            typed_password = getpass.getpass("New password: ")
            if typed_password != getpass.getpass("Confirm: "):
                sys.exit("Passwords don't match — nothing changed.")

        new_password = reset_password(db, args.username, typed_password)

    if new_password is None:
        sys.exit(f"No user named '{args.username.strip().lower()}'. Try: find <text>")

    print(f"Password reset for '{args.username.strip().lower()}'.")
    if not args.prompt:
        print(f"Temporary password: {new_password}")


if __name__ == "__main__":
    main()
