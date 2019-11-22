---
marp: true
---

<style>
* {
  line-height: 3rem;
}
</style>


# Algebra with ![cats logo](./assets/cats-logo.png)

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

## Let's take an example

```scala
def sumInts(list: List[Int]): Int =
  list.foldRight(0)(_ + _)

def concatStrings(list: List[String]): String =
  list.foldRight("")(_ ++ _)

def unionSets[A](list: List[Set[A]]): Set[A] =
  list.foldRight(Set.empty[A])(_ union _)
```

They all follow a common pattern `initial value` + `combining function`

---

## Extracting the commonalities

In a trait...

```scala
trait Monoid[A] {
  def empty: A
  def combine(x: A, y: A): A
}
```

---

## Implementation for summing `Int`s

Original:

```scala
def sumInts(list: List[Int]): Int =
  list.foldRight(0)(_ + _)
```

Creating an instance of `Monoid[Int]`

```scala
val intAdditionMonoid: Monoid[Int] = new Monoid[Int] {
  def empty: Int = 0
  def combine(x: Int, y: Int): Int = x + y
}
```

---

### ... doing the same for the rest

We can simply write the following

```scala
def combineAll[A](list: List[A], A: Monoid[A]): A =
  list.foldRight(A.empty)(A.combine)
```

---

## Typeclasses vs. Subtyping

```scala
def combineAll[A <: Monoid[A]](list: List[A]): A = ???
```

---

### Trick question

```scala
def combineAll[A](list: List[A], A: Monoid[A]): A =
  list.foldRight(A.empty)(A.combine)
```

Can this be made better?

---

### Mochiron desu!

New:

```scala
def combineAll[A](list: List[A])(implicit A: Monoid[A]): A =
  list.foldRight(A.empty)(A.combine)
```

Previous:

```scala
def combineAll[A](list: List[A], A: Monoid[A]): A =
  list.foldRight(A.empty)(A.combine)
```