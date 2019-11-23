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

---

## Semigroup

If type `A` can form a semigroup it has an **associative binary operation**.

Example:

```scala
x + (y + z) = (x + y) + z
```

---

### What makes a Semigroup different from a Monoid

- Semigroups don't have an **identity** value
- It's a weaker algebra compared to Monoids

---

Let's take for instance...

```scala
class NonEmpty[A](head: A, tail: List[A])
```

### A `NonEmpty` list datatype

- A `NonEmpty` list is a list that can never be empty
- It can never be modelled as a Monoid. Why?

---

### The `Semigroup` trait

```scala
trait Semigroup[A] {
  def combine(x: A, y: A): A
}
```

---

### Here's how an addition semigroup could be defined

```scala
import cats.Semigroup

implicit val intAdditionSemigroup: Semigroup[Int] = new Semigroup[Int] {
  def combine(x: Int, y: Int): Int = x + y
}
```

---

### It can be used as follows

```scala
val x = 1
val y = 2
val z = 3

Semigroup[Int].combine(x, y)
// res0: Int = 3

Semigroup[Int].combine(x, Semigroup[Int].combine(y, z))
// res1: Int = 6

Semigroup[Int].combine(Semigroup[Int].combine(x, y), z)
// res2: Int = 6
```

---

### Semigroups support an infix syntax

```scala
import cats.implicits._

1 |+| 2
// res3: Int = 3
```

---

### Another example

```scala
import cats.implicits._

val map1 = Map("hello" -> 1, "world" -> 1)
val map2 = Map("hello" -> 2, "cats"  -> 3)

Semigroup[Map[String, Int]].combine(map1, map2)
// res4: Map[String,Int] = Map(hello -> 3, cats -> 3, world -> 1)

map1 |+| map2
// res5: scala.collection.immutable.Map[String,Int] = Map(hello -> 3, cats -> 3, world -> 1)
```

---

### So finally the `combineAll` operation

```scala
def combineAll[A: Semigroup](as: List[A]): A =
  as.foldLeft(/* ?? what goes here ?? */)(_ |+| _)
```

- If `List[A]` is empty, then there's no fallback identity value
