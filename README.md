# Virtual-Room
A virtual room where friends share videos among them in real time directly over the web browser, with synchronized playback and a video chat at the same time.

Initiate a virtual environment(if preferred) and install requirements to run the server
Go in the server directory(test_Virtual_room)

Initiate virtual environment - `virtualenv <name of the virtual environment>`

`source <name of the virtual environment>/bin/activate`

Now install the requirements
```
sudo pip install -r requirements.txt 
```

To test the server, go into the directory `test_Virtual_room` - 

``` 
python manage.py runserver 3000
```

After making any changes in static files run-

```
python manage.py collectstatic
```
