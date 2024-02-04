import os
import time

# RULES OF LIFE
#   1.  Any live cell with less than two live neighbours dies, as if caused by under-population.
#   2.  Any live cell with two or three live neighbours lives on to the next generation.
#   3.  Any live cell with more than three live neighbours dies, as if by overcrowding.
#   4.  Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

def seed():
    board[12][11] = "X"
    board[12][12] = "X"
    board[12][13] = "X"

def display():
    for row in board:
        print("".join(row))

def update():
    for row in range(0, len(board)):
        for column in range(0, len(board[row])):
            neighbors = 0
            for r in range(-1, 2):
                for c in range(-1, 2):
                    if r != 0 and c != 0:
                        try:
                            if board[r][c] == "X":
                                neighbors += 1

                        except IndexError:
                            pass
