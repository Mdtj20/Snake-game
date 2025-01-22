# https://mdtj20.github.io/Snake-game/
用空格暂停哦！
# 这是一个贪吃蛇小游戏

## 游戏有很多东西

## 如：

### **障碍物（Obstacles）**

- **定义**：地图中不可通过的固定物体。如果蛇头碰到障碍物，游戏结束。

- 特点
  1. 通常是灰色或其他显眼的颜色，用于区分于蛇和食物。
  2. 随机生成在地图上，但不会生成在蛇的初始位置或与食物重叠。
  3. 数量可根据难度设置，越高难度，障碍物越多。

- **作用**：增加游戏难度，玩家需要小心避开障碍物。

------

### **食物（Food）**

- **定义**：地图上的可收集物品，蛇吃到食物会加分并变长。

- 特点
  1. 有不同种类的食物，每种食物可能有不同颜色和效果。
     - **普通食物（红色）**：加 1 分。
     - **加速食物（蓝色）**：加 3 分，并增加蛇的速度。
     - **减速食物（黄色）**：加 2 分，并降低蛇的速度。
  2. 随机生成在地图上，不与障碍物或蛇的身体重叠。

- **作用**：是玩家的主要目标，吃食物得分，同时蛇会变长，增加挑战性。