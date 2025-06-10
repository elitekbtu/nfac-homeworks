from sqlalchemy import Column,Integer,String 
from app.db.base import Base 


class Task(Base):
    __tablename__="tasks"
    id=Column(Integer,primary_key=True,index=True)
    description=Column(String,index=True)
    title=Column(String,index=True)
    