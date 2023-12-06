import numpy as np
import cv2 as cv

rostro = cv.CascadeClassifier('./cascade.xml')

cap = cv.VideoCapture(0)
x=y=w=h= 0 
img = 0
count = 0
while True:
    ret, frame = cap.read()
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    rostros = rostro.detectMultiScale(gray, 1.1, 3)
    for(x, y, w, h) in rostros:
        m= int(h/2)
        frame = cv.rectangle(frame, (x,y), (x+w, y+h), (0, 255, 0), 2)

    cv.imshow('rostros', frame)
    
    k = cv.waitKey(1)
    if k == 27:
        break
cap.release()
cv.destroyAllWindows()
    