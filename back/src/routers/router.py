from fastapi import APIRouter
from routers import target
from routers import login
from routers import weight
from routers import room
from routers import user
from routers import auth

router = APIRouter()

router.include_router(login.login_router, prefix="/login")
router.include_router(user.user_router, prefix="/user")
router.include_router(auth.auth_router, prefix="/auth")
router.include_router(target.target_router, prefix="/target")
router.include_router(weight.weight_router, prefix="/weight")
router.include_router(room.room_router, prefix="/room")
