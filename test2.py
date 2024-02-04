import pygame,sys,os

pygame.init()

DISPLAY = pygame.display.set_mode((800,800))
pygame.display.set_caption("Game of Life")
CLOCK = pygame.time.Clock()

H_CELLS = []
V_CELLS = []

A_CELLS = []
SUB = []

for i in range(80):
    SUB = []
    for j in range(80):
        SUB.append(0)
    A_CELLS.append(SUB)

for i in range(80):
    H_CELLS.append(i)
    V_CELLS.append(i)

def g(S, i, j):
    try:
        return S[i][j]
    except IndexError:
        return 0
        
def update(A_CELLS):
    U_CELLS = A_CELLS

    for i in range(len(A_CELLS)):
        for j in range(len(A_CELLS[i])):

            SUM = g(A_CELLS,i-1,j+1)+g(A_CELLS,i,j+1)+g(A_CELLS,i+1,j+1)+g(A_CELLS,i-1,j)+g(A_CELLS,i+1,j)+g(A_CELLS,i-1,j-1)+g(A_CELLS,i,j-1)+g(A_CELLS,i+1,j-1)
            if SUM > 0:
                print(SUM)
            if A_CELLS[i][j] == 1:
                if SUM == 2 or SUM == 3:
                    U_CELLS[i][j] = 1
                else:
                    U_CELLS[i][j] = 0
            elif A_CELLS[i][j] == 0:
                if SUM == 3:
                    U_CELLS[i][j] = 1
    
    return U_CELLS

def add_cell():
    global A_CELLS

    pos = pygame.mouse.get_pos()

    M_X = pos[0]
    M_Y = pos[1]

    while M_X % 10 != 0:
        M_X -= 1
    while M_Y % 10 != 0:
        M_Y -= 1

    A_CELLS[int(M_X/10)][int(M_Y/10)] = 1

def remove_cell():
    global A_CELLS

    pos = pygame.mouse.get_pos()

    M_X = pos[0]
    M_Y = pos[1]

    while M_X % 10 != 0:
        M_X -= 1
    while M_Y % 10 != 0:
        M_Y -= 1

    A_CELLS[int(M_X/10)][int(M_Y/10)] = 0

def main():
    global A_CELLS
    while main:
        event = pygame.event.poll()
        
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        if event.type == pygame.KEYDOWN:
            A_CELLS = update(A_CELLS)

        mouse = pygame.mouse.get_pressed()

        if mouse[0]:
            add_cell()
        if mouse[2]:
            remove_cell()
        
        DISPLAY.fill((0,0,0))

        for i in range(len(A_CELLS)):
            for j in range(len(A_CELLS[i])):
                if A_CELLS[i][j] == 1:
                    pygame.draw.rect(DISPLAY, (255,255,255),(i*10,j*10,10,10))

        for i in H_CELLS:
            pygame.draw.rect(DISPLAY, (80,80,80),((i+1)*10,0,1,800))
        for i in V_CELLS:
            pygame.draw.rect(DISPLAY, (80,80,80),(0,(i+1)*10,800,1))

        pygame.display.update()
        CLOCK.tick(120)

main()
