@echo off
echo Initializing MongoDB as Replica Set...
mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"
echo Done! MongoDB is now running as a replica set.
pause
