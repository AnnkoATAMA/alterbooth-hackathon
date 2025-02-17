from fastapi import APIRouter
from routers import target
from routers import weight
from routers import achive

router = APIRouter()

router.include_router(target.target_router, prefix="/target")
# router.include_router(weight.weight_router, prefix="/weight")
# router.include_router(achive.achive_router, prefix="/achive")