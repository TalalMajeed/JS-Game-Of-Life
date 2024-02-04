import pygame,sys,os

pygame.init()

DISPLAY = pygame.display.set_mode((800,800))
pygame.display.set_caption("Game of Life")
CLOCK = pygame.time.Clock()

H_CELLS = []
V_CELLS = []

A_CELLS = [] #[[0,0,1],[0,1,1]]

for i in range(80):
    for j in range(80):
        A_CELLS.append([i,j,0])

for i in range(80):
    H_CELLS.append(i)
    V_CELLS.append(i)

def update():
    global A_CELLS

    for i in A_CELLS:
        ROW = i[0]
        COLUMN = i[1]

def add_cell():
    global A_CELLS

    pos = pygame.mouse.get_pos()

    M_X = pos[0]
    M_Y = pos[1]

    while M_X % 10 != 0:
        M_X -= 1
    while M_Y % 10 != 0:
        M_Y -= 1

    if [M_X/10,M_Y/10,1] in A_CELLS:
        return
    elif [M_X/10,M_Y/10,0] in A_CELLS:
        A_CELLS[A_CELLS.index([M_X/10,M_Y/10,0])] = [M_X/10,M_Y/10,1]
    else:
        A_CELLS.append([M_X/10,M_Y/10,1])

def remove_cell():
    global A_CELLS

    pos = pygame.mouse.get_pos()

    M_X = pos[0]
    M_Y = pos[1]

    while M_X % 10 != 0:
        M_X -= 1
    while M_Y % 10 != 0:
        M_Y -= 1
        
    if [M_X/10,M_Y/10,1] not in A_CELLS:
        return
    elif [M_X/10,M_Y/10,1] in A_CELLS:
        A_CELLS[A_CELLS.index([M_X/10,M_Y/10,1])] = [M_X/10,M_Y/10,0]
    else:
        A_CELLS.append([M_X/10,M_Y/10,0])

def main():
    global A_CELLS
    while main:
        event = pygame.event.poll()
        
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        if event.type == pygame.KEYDOWN:
            update()

        mouse = pygame.mouse.get_pressed()

        if mouse[0]:
            add_cell()
        if mouse[2]:
            remove_cell()

        for i in A_CELLS:
            if i[2] == 1:
                pygame.draw.rect(DISPLAY, (255,255,255),(i[0] * 10,i[1] * 10,10,10))
            if i[2] == 0:
                pygame.draw.rect(DISPLAY, (0,0,0),(i[0] * 10,i[1] * 10,10,10))
        for i in H_CELLS:
            pygame.draw.rect(DISPLAY, (80,80,80),((i+1)*10,0,1,800))
        for i in V_CELLS:
            pygame.draw.rect(DISPLAY, (80,80,80),(0,(i+1)*10,800,1))

        pygame.display.update()
        CLOCK.tick(120)

main()
