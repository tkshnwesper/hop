---
marp: true
---

# Algebra

---

## Typeclasses

Type classes are a powerful tool used in functional programming to enable **ad-hoc polymorphism**, more commonly known as overloading.

---

## What is ad-hoc polymorphism

```python

1 + 2 = 3

3.14 + 0.0015 = 3.1415

1 + 3.7 = 4.7

[1, 2, 3] + [4, 5, 6] = [1, 2, 3, 4, 5, 6]

[true, false] + [false, true] = [true, false, false, true]

"bab" + "oon" = "baboon"
```

---

### Differences between polymorphism in functional and object oriented approaches

- Object oriented languages leverage **sub-typing** for polymorphic code

- Functional languages combine **parametric polymorphism** and **ad-hoc polymorphism**

---

```scala
def sumInts(list: List[Int]): Int = list.foldRight(0)(_ + _)

def concatStrings(list: List[String]): String = list.foldRight("")(_ ++ _)

def unionSets[A](list: List[Set[A]]): Set[A] = list.foldRight(Set.empty[A])(_ union _)
```
