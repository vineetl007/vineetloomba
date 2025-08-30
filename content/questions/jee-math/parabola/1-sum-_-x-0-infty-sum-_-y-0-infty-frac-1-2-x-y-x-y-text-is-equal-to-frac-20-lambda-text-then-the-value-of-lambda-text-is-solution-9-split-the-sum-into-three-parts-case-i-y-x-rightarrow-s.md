---
title: p45
chapter: parabola
dpp: 2
difficulty: Easy
question_type: Integer Type
question: >-
  1. $$ \sum\_{x=0}^{\infty} \sum\_{y=0}^{\infty} \frac{1}{2^{x+y+|x-y|}} \text{
  is equal to } \frac{20}{\lambda} \text{ then the value of } \lambda \text{ is}
  $$


  \### Solution : (9)


  Split the sum into three parts


  \### Case I : $y = x$


  $$


  \Rightarrow S\_1 = \sum\_{x=0}^{\infty} \frac{1}{2^{2x}} = \frac{1}{1-1/4} = \frac{4}{3}


  $$


  \### Case II: $y = x + d$; $d > 0$


  $$


  \Rightarrow S\_2 = \sum\_{d=1}^{\infty} \sum\_{x=0}^{\infty} \frac{1}{2^{2x+2d}} = \sum\_{d=1}^{\infty} \frac{1}{2^{2d}} \times \sum_{x=0}^{\infty} \frac{1}{2^{2x}}


  $$


  $$


  \= \frac{1}{3} \times \frac{4}{3} = \frac{4}{9}


  $$


  \### Case III : $y = x - d$; $d > 0$


  $\Rightarrow S_3$ is just obtained by switching $x$ and $y$


  $\Rightarrow S_3 = S_2$


  $$


  S_1 + S_2 + S_3 = \frac{4}{3} + \frac{4}{9} + \frac{4}{9} = \frac{20}{9}


  $$


  $$


  \therefore \lambda = 9


  $$
numerical_answer: "12"
solution: >-
  solutions 


  1. $$ \sum\_{x=0}^{\infty} \sum\_{y=0}^{\infty} \frac{1}{2^{x+y+|x-y|}} \text{ is equal to } \frac{20}{\lambda} \text{ then the value of } \lambda \text{ is} $$


  \### Solution : (9)


  Split the sum into three parts


  \### Case I : $y = x$


  $$


  \Rightarrow S\_1 = \sum\_{x=0}^{\infty} \frac{1}{2^{2x}} = \frac{1}{1-1/4} = \frac{4}{3}


  $$


  \### Case II: $y = x + d$; $d > 0$


  $$


  \Rightarrow S\_2 = \sum\_{d=1}^{\infty} \sum\_{x=0}^{\infty} \frac{1}{2^{2x+2d}} = \sum\_{d=1}^{\infty} \frac{1}{2^{2d}} \times \sum_{x=0}^{\infty} \frac{1}{2^{2x}}


  $$


  $$


  \= \frac{1}{3} \times \frac{4}{3} = \frac{4}{9}


  $$


  \### Case III : $y = x - d$; $d > 0$


  $\Rightarrow S_3$ is just obtained by switching $x$ and $y$


  $\Rightarrow S_3 = S_2$


  $$


  S_1 + S_2 + S_3 = \frac{4}{3} + \frac{4}{9} + \frac{4}{9} = \frac{20}{9}


  $$


  $$


  \therefore \lambda = 9


  $$
---
