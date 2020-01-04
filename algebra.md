---
marp: true
theme: gaia
class: lead gaia
---

<style>
* {
  line-height: 3rem;
}
</style>

# Higher order polymorphism with

![cats logo](./assets/cats-logo.png)

---

<!-- _class: invert lead -->

## Prelude

Scala does not have static methods

---

### ...however

---

### This comes pretty damn close

```scala
object CoolPerson {
  def putOnSomeSwag = ???
}

CoolPerson.putOnSomeSwag  // 😁
```

---

### You could even write something like this

```scala
trait CatPerson {
  def petTheKitty = ???
}

object CatPerson extends CatPerson  // lolwut 🤷‍♀️

CatPerson.petTheKitty // 😼
```

---

```scala
sealed trait Food
case class Nachos() extends Food

trait ComfortFood[F] {
  def eatLikeThereIsNoTomorrow = ???
}

object ComfortFood {
  def apply[A](implicit ev: ComfortFood[A]): ComfortFood[A] = ev
}

implicit val 🧀 = new ComfortFood[Nachos] {}
ComfortFood[Nachos].eatLikeThereIsNoTomorrow
```

---

## ...and now to the crux of the matter

---

## Typeclasses

Type classes are a powerful tool used in functional programming to enable **ad-hoc polymorphism**, more commonly known as **overloading**.

---

### What is ad-hoc polymorphism

```python
1 + 2 = 3
3.14 + 0.0015 = 3.1415
[1, 2, 3] + [4, 5, 6] = [1, 2, 3, 4, 5, 6]
[true, false] + [false, true] = [true, false, false, true]
"bab" + "oon" = "baboon"
```

---

### How Typeclasses differ from interfaces

---

### Take for instance this piece of Java code

```java
class Foo {}

interface Summable<T> {
  T sum (T arg);
}

(new Foo()).sum(new Foo())  // ❌
```

Oopsie daisy! `Foo` forgot to implement the `Summable` interface in order to be able to get summed up with other `Foo`s

---

### Scala shows us who is boss

```scala
class Foo

implicit class FooWithSum(arg0: Foo) {
  def sum(arg1: Foo): Foo = ???
}

(new Foo) sum (new Foo) // ✅
```

---

### Something less fancy but more meaningful

```scala
class Foo

trait Summable[T] {
  def sum(arg: T): T
}

implicit def foo2Summable(arg0: Foo): Summable[Foo] = new Summable[Foo] {
  def sum(arg1: Foo): Foo = ???
}

(new Foo) sum (new Foo) // ✅
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

This is just an example, the actual `Monoid` trait does not look like this

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

### Similarly for strings

```scala
implicit val stringMonoid: Monoid[String] = new Monoid[String] {
  def empty: String = ""
  def combine(x: String, y: String): String = x ++ y
}
```

---

### ...and sets

```scala
implicit def setMonoid[A]: Monoid[Set[A]] = new Monoid[Set[A]] {
  def empty: Set[A] = Set.empty
  def combine(x: Set[A], y: Set[A]): Set[A] = x union y
}
```

---

### Putting it all together

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

### What is the problem with that approach

```scala
val a = List(1, 2, 3)
combineAll(a) // ✅

val a = Nil
combineAll(a) // ❌
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

## Monoid

---

### `Monoid` extends the `Semigroup` trait

```scala
trait Semigroup[A] {
  def combine(x: A, y: A): A
}

trait Monoid[A] extends Semigroup[A] {
  def empty: A
}
```

---

### Meaning of identity

`empty` should be an **identity** for the `combine` operation

```scala
combine(x, empty) = combine(empty, x) = x
```

---

## What makes a `Semigroup` different from a `Monoid`

---

### The `combineAll` operation

```scala
def combineAll[A: Semigroup](as: List[A]): A =
  as.foldLeft(/* ?? what goes here ?? */)(_ |+| _)
```

- If `List[A]` is empty, then there's no fallback identity value

---

### A `NonEmptyList` list datatype

```scala
final case class NonEmptyList[A](head: A, tail: List[A])
```

- A `NonEmptyList` is a list that can never be empty
- It can never be modelled as a **Monoid**. Why?

---

### ...but wait, can't you do this

```scala
NonEmptyList(null, Nil)
// res2: NonEmptyList[Null] = NonEmptyList(null,List())
```

#### Here's a quote from the **Scala Book**

> *Functional programming* is like writing a series of *algebraic equations*, and **because you don’t use null values in algebra, you don’t use null values in FP**.

---

### Implementation of our `NonEmptyList`

```scala
final case class NonEmptyList[A](head: A, tail: List[A]) {
  def ++(other: NonEmptyList[A]): NonEmptyList[A] =
    NonEmptyList(head, tail ++ other.toList)

  def toList: List[A] = head :: tail
}
```

---

## Functor

- A *type class* that abstracts over *type constructors* that can be `map`'d over.
- Example: `List`, `Option` and `Future`

```scala
Some(10).map(_ * 3)
// res0: Option[Int] = Some(30)
```

---

### Type constructors

- `Option` by itself is not a *concrete type*
- Only when it takes a **type parameter** does it become concrete
- Example: `Option[String]`

```scala
val a: Option = None
// ❌ error: class Option takes type parameters

val a: Option[Int] = Some(1)
// ✅
```

---

### How Functors are defined

```scala
trait Functor[F[_]] {
  def map[A, B](fa: F[A])(f: A => B): F[B]
}
```

- `fa` is a value wrapped in a `Functor`
- `f` is a function that takes `A` and returns `B`

---

### Let's see what a Functor for `Option` class looks like

```scala
implicit val functorForOption: Functor[Option] = new Functor[Option] {
  def map[A, B](fa: Option[A])(f: A => B): Option[B] = fa match {
    case None    => None
    case Some(a) => Some(f(a))
  }
}
```

---

### Example

Performing `map` on `Option` will apply the function only on `Some` instances

```scala
val a = Some(1)
a.map(_ + 1)  // Some(2)

val b: Option[Int] = None
b.map(_ + 1)  // None
```

---

### Laws of Functors

1. Composition ❤
2. Identity 👨‍🎤

---

#### Composition ❤

```scala
fa.map(f).map(g) = fa.map(f.andThen(g))
```

Mapping with `f` and then again with `g` is the same as mapping once with the composition of `f` and `g`.

---

```scala
val a = List(1, 0, 1, 1, 0)

val f: (Int => Boolean) = {
  case 0 => false
  case 1 => true
}

val g: (Boolean => String) = {
  case true => "Yes"
  case false => "No"
}

a.map(f).map(g) // List(Yes, No, Yes, Yes, No)
// should equal
a.map(f andThen g) // List(Yes, No, Yes, Yes, No)
```

---

#### Identity 👨‍🎤

```scala
fa.map(x => x) = fa
```

Mapping with the identity function is a **no-op**.

---

### Functors from a different perspective

```scala
trait Functor[F[_]] {
  def map[A, B](fa: F[A])(f: A => B): F[B]

  def lift[A, B](f: A => B): F[A] => F[B] =
    fa => map(fa)(f)
}
```

`F` allows the lifting of a **pure function** `A => B` into the **effectful function** `F[A] => F[B]`.

---

### Functors for effect management

```scala
trait Functor[F[_]] { /*...*/ }
```

- The `F` in `Functor` is referred to as **effect** or **computational context**
- Different contexts abstract away different behaviors

---

### Composing Functors

- To avoid `_.map(_.map(_.map(f)))` while working with `Option[List[A]]` or `List[Either[String, Future[A]]]`
- Does not wrap the value

```scala
val listOption = List(Some(1), None, Some(2))
// listOption: List[Option[Int]] = List(Some(1), None, Some(2))

// Through Functor#compose
Functor[List].compose[Option].map(listOption)(_ + 1)
// res1: List[Option[Int]] = List(Some(2), None, Some(3))
```

---

### Limitations of composing

<!-- Both data and Functor's implementation need to be passed to `needsFunctor` -->

```scala
val listOption = List(Some(1), None, Some(2))

def needsFunctor[F[_]: Functor, A](fa: F[A]): F[Unit] =
  Functor[F].map(fa)(_ => ())

def foo: List[Option[Unit]] = {
  val listOptionFunctor = Functor[List].compose[Option]
  type ListOption[A] = List[Option[A]]
  needsFunctor[ListOption, Int](listOption)(listOptionFunctor)
}
```

---

### Nesting Functors

```scala
val nested: Nested[List, Option, Int] = Nested(listOption)
// nested: cats.data.Nested[List,Option,Int] = Nested(List(Some(1), None, Some(2)))

nested.map(_ + 1)
// res2: cats.data.Nested[List,Option,Int] = Nested(List(Some(2), None, Some(3)))
```

- Involves syntactic overhead of wrapping and unwrapping

---

## The End
