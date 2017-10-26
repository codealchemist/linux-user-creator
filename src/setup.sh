#!/bin/bash
USER=$1

echo "Create new user $USER at $(date)" >> /var/log/step3
useradd -d /tmp -g 999 -s /usr/bin/step3 $USER 2>&1 >> /var/log/step3

echo "Set password $2 for user $USER at $(date)" >> /var/log/step3
echo "expect -c \"spawn /usr/bin/passwd $USER; expect \\\"password:\\\"; send \\\"$2\\r\\\"; expect \\\"password:\\\"; send \\\"$2\\r\\\"; expect eof\"" >> /var/log/step3
expect -c "spawn /usr/bin/passwd $USER; expect \"password:\"; send \"$2\r\"; expect \"password:\"; send \"$2\r\"; expect eof" 2>&1 >> /var/log/step3
echo "" >> /var/log/step3

echo "Start creating image for $USER at $(date)" >> /var/log/step3
cd /tmp/$USER
docker build -t "$(echo $USER | tr '@' '_')" . 2>&1 >> /var/log/step3
echo "" >> /var/log/step3

echo "Deleting local FS /tmp/$USER at $(date)" >> /var/log/step3
cd /tmp
rm -rf /tmp/$USER 2>&1 >> /var/log/step3
echo "Finish creating image for $USER at $(date)" 2>&1 >> /var/log/step3
