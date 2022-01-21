# fullstack for frontend devs on frontend masters

### Set up ubuntu server

A VPS is a virtual private server in the cloud. To login to your VPS, you can use SSH. SSH is made up of a private key and a private key. You generate the key pair, and then provide your VPS provider with the public key. 

```bash
# make the directory if it does not exist 
cd ~/.ssh
ls
# generate a private/public key pair
ssh-keygen
```

The `.pub` key is the public key. The you can ssh into your vps:

```bash
# You must be in the same directory as your key (~/.ssh)
ssh -i $PRIVATE_KEY_NAME $USER@$IPADDRESS
# Example
ssh -i fsfe root@159.223.184.64
```

The you will be in your VPS. To exit, enter `exit`.

Disable root user access on your ubuntu server. Instead create a new user with super user (sudo group) privelages. Root user can do anything, which is dangerous for you but also because if anyone hacked into your server, they could do anything without an additional password.

```bash
apt update
apt upgrade
adduser $USERNMAE
#Example
adduser peter
# You are still the root user. Add "peter" to sudo group
usermod -aG sudo peter
# Switch user
su peter
# Check user access to logs to ensure sudo priv. works
sudo cat /var/log/auth.log
# As the new user, you need to add your ssh key .pub to your new user's ssh authorized_keys directory
# This will allow us to ssh in to the server as this new user instead of having to ssh in as root
vi ~/.ssh/authorized_keys # Create these if any don't exist already
```

Then get your public key from your local machine `~/.ssh` and paste it into `authorized_keys`

```bash
#Now you can "exit" the vps shell and login as the user
ssh -i fsfe peter@159.223.184.64
# For safety change permissions so it's readable and writable by only our new user, sudo, or ssh daemons
chmod 644 ~/.ssh/authorized_keys
# disable root login by opening the ssh daemon config. This is always running in the background
sudo vi /etc/ssh/sshd_config
# Update PermitRootLogin to "no"
```

### Set up nginx

What is Nginx? It is a web server first and foremost. That means it responds to http requests with http responses. Nginx is also often times used as a reverse proxy server. It's still a web server (it's always a web server), but in this case it receives requests and directs them to a certain application server. The application server is for coding more complex tasks as oppossed to just serving up static content. You could just use nginx to serve up static content.

```
location / {
        proxy_pass http://127.0.0.1:3000/;
}
```

The location block for `/` defines a `proxy_pass` that says any request to our web server at `/` should be redirected to the same server (127.0.0.1) at port 3000, where our nodejs application server is listening for requests. Note the difference between the nodejs "application" server and the nginx "web" server. nginx is our gateway to the internet and can handle all sorts of things for us, like enabling http2, https, request proxying and much more.

### pm2

Use `pm2` as a process manager to keep your app continuously running on your server. `pm2` can be configured to start up your app on server boot. `pm2` can run a process as a daemon, which is a program continuously running in the background. Process managers also handles application server restarts if anything fails. Another Process manager is called `forever`.

Example setup of `pm2`

```bash
sudo npm i -g pm2
# Start the app with pm2
pm2 start app.js
# Setup auto restart on server restart
pm2 startup
```

### ufw and Firewall

ufw stands for uncomplicated firewall.

### VIM

`vi` command will open a file in VIM. Enter `ESC` to enter a command. Enter `:` to make VIM accept a command. `:q` will quit VIM. `:wq` will write the file and quit. Enter `i` will in command mode to enter INSERT mode, so you can edit a file.  

### HTTPS cert and http2

Update your nginx config with the server name

`sudo vi /etc/nginx/sites-available/default`

For example, insert "peterszujewski.xyz www.peterszujewski.xyz" under the nginx `server_name` field. You cannot just use the IP address here, since IP addresses can change but domain names are owned by specific people. So the server name must be a domain name. 

https://certbot.eff.org

Download certbot on your server, generate a certificate, and allow certbot to update your nginx config to allow https (route traffic via port 443, which is the https port).

Allow https on port 443 by ensuring your firewall allows it: `sudo ufw allow https`

Then you can visit your site using https. You don't need to refresh your server or nginx or anything. Your nginx config will be very different. 

Http2 allows http to run over fewer TCP connections, but to handle requests for multiple resources (multiplexing). With Http 1, every request required its own TCP handlshake (the exchange of specific TCP data packets that established the connection between client and server). You should enable http2 with nginx:

```
$ sudo vi /etc/nginx/sites-available/default

// Then add this to the nginx config...
// listen 443 http2 ssl;
// for example

listen [::]:443 http2 ssl ipv6only=on; # managed by Certbot
listen 443 http2 ssl; # managed by Certbot

// I added the "http2" bit.
```

Then reload nginx: `$ sudo service nginx reload`

A note on http3: Http3 is technically out and it runs on UDP instead of TCP. UDP is different from TCP in that is just "blasts" data packets rather than going through many handshakes to be sure no packets are lost. This is because the internet is a utility staple at this point and connections are much much more reliable than say the dial-up days. Packets are much less likely to be lost between clients and server.

