package com.chapterzero.backend.config;

import com.chapterzero.backend.entity.Book;
import com.chapterzero.backend.entity.BookChapter;
import com.chapterzero.backend.repository.BookChapterRepository;
import com.chapterzero.backend.repository.BookRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DemoBookInitializer {

    @Bean
    CommandLineRunner insertDemoBook(
            BookRepository bookRepository,
            BookChapterRepository chapterRepository
    ) {

        return args -> {

            // =====================================================
            // CREATE DEMO BOOK
            // =====================================================

            Book book = bookRepository.findAll().stream()
                    .filter(existingBook -> existingBook.getTitle() != null
                            && existingBook.getTitle().equalsIgnoreCase(
                                    "Alice's Adventures in Wonderland"
                            ))
                    .findFirst()
                    .orElse(null);

            if (book == null) {

                book = new Book();

                book.setTitle(
                        "Alice's Adventures in Wonderland"
                );

                book.setAuthor(
                        "Lewis Carroll"
                );

                book.setIsbn(
                        "9780486282745"
                );

                book.setDescription(
                        "Alice's Adventures in Wonderland is a classic fantasy novel "
                        + "about a young girl named Alice who falls down a rabbit hole "
                        + "and enters a strange and magical world filled with unusual "
                        + "creatures, curious characters, and impossible adventures."
                );

                book.setCoverUrl(
                        "https://covers.openlibrary.org/b/isbn/9780486282745-L.jpg"
                );

                book = bookRepository.save(book);

                System.out.println(
                        "✓ Demo book created: Alice's Adventures in Wonderland"
                );

            } else {

                System.out.println(
                        "✓ Demo book already exists."
                );
            }


            // =====================================================
            // CREATE CHAPTERS
            // =====================================================

            if (chapterRepository
                    .findByBookIdOrderByChapterNumberAsc(book.getId())
                    .isEmpty()) {

                addChapter(
                        chapterRepository,
                        book,
                        1,
                        "Down the Rabbit-Hole",
                        """
                        Alice was beginning to get very tired of sitting by her sister
                        on the bank, and of having nothing to do. Once or twice she had
                        peeped into the book her sister was reading, but it had no
                        pictures or conversations in it.

                        Suddenly a White Rabbit with pink eyes ran close by her.

                        There was nothing so very remarkable in that; nor did Alice
                        think it so very much out of the way to hear the Rabbit say
                        to itself, "Oh dear! Oh dear! I shall be late!"

                        But when the Rabbit actually took a watch out of its
                        waistcoat-pocket, and looked at it, and then hurried on,
                        Alice started to her feet.

                        It flashed across her mind that she had never before seen
                        a rabbit with either a waistcoat-pocket, or a watch to take
                        out of it.
                        """
                );

                addChapter(
                        chapterRepository,
                        book,
                        2,
                        "The Pool of Tears",
                        """
                        Alice found herself falling down a very deep well.

                        Either the well was very deep, or she fell very slowly,
                        for she had plenty of time as she went down to look about
                        her and to wonder what was going to happen next.

                        She tried to look down and make out what she was coming to,
                        but it was too dark to see anything.

                        Down, down, down.

                        Would the fall NEVER come to an end?
                        """
                );

                addChapter(
                        chapterRepository,
                        book,
                        3,
                        "A Caucus-Race and a Long Tale",
                        """
                        Alice found herself in a large hall with doors all around it.

                        She discovered a little golden key which opened a tiny door.
                        Behind the door was a beautiful garden, but Alice was too large
                        to enter.

                        After many curious events, she found herself surrounded by
                        strange creatures.

                        They gathered together for a very peculiar race in which
                        everyone ran in different directions.
                        """
                );

                addChapter(
                        chapterRepository,
                        book,
                        4,
                        "The Rabbit Sends in a Little Bill",
                        """
                        The White Rabbit came hurrying back to the house.

                        He was extremely anxious and called out for help.

                        Alice entered the house and soon discovered that the rooms
                        of Wonderland did not obey ordinary rules.

                        She grew larger and larger until she could hardly fit inside.

                        The creatures outside became increasingly confused by what
                        was happening.
                        """
                );

                addChapter(
                        chapterRepository,
                        book,
                        5,
                        "Advice from a Caterpillar",
                        """
                        Alice came upon a large blue Caterpillar sitting on the top
                        of a mushroom.

                        The Caterpillar looked at her for some time and finally asked,
                        "Who are YOU?"

                        Alice admitted that she hardly knew who she was anymore.

                        Everything in Wonderland seemed to change her size,
                        her surroundings, and even her understanding of herself.
                        """
                );

                addChapter(
                        chapterRepository,
                        book,
                        6,
                        "Pig and Pepper",
                        """
                        Alice approached a strange house where a Duchess lived.

                        Inside, everything was chaotic.

                        There was a cook preparing soup, a baby crying loudly,
                        and clouds of pepper filling the room.

                        Alice tried to make sense of the strange household,
                        but Wonderland continued to become more absurd.
                        """
                );

                addChapter(
                        chapterRepository,
                        book,
                        7,
                        "A Mad Tea-Party",
                        """
                        Alice came to a large table set out beneath a tree.

                        The Mad Hatter, the March Hare, and a sleepy Dormouse
                        were having tea.

                        Alice joined them, but the conversation quickly became
                        confusing.

                        Time itself seemed to behave strangely at the table,
                        and the tea party never seemed to reach an ordinary ending.
                        """
                );

                addChapter(
                        chapterRepository,
                        book,
                        8,
                        "The Queen's Croquet-Ground",
                        """
                        Alice entered the garden of the Queen of Hearts.

                        Everyone seemed frightened of the Queen.

                        The Queen ordered strange games and expected everyone
                        to obey immediately.

                        Alice soon discovered that the Queen's favourite game
                        was a very unusual version of croquet.
                        """
                );

                addChapter(
                        chapterRepository,
                        book,
                        9,
                        "The Mock Turtle's Story",
                        """
                        Alice met the Mock Turtle, who began telling her about
                        his education under the sea.

                        He described lessons with strange names and stranger
                        teachers.

                        Alice listened carefully, although she could not understand
                        how anything in Wonderland could possibly make sense.
                        """
                );

                addChapter(
                        chapterRepository,
                        book,
                        10,
                        "The Lobster Quadrille",
                        """
                        The Mock Turtle continued his strange story.

                        He and the Gryphon explained the Lobster Quadrille,
                        a curious dance involving creatures of the sea.

                        Alice listened as they described the rules of the dance
                        and the peculiar world beneath the waves.
                        """
                );

                addChapter(
                        chapterRepository,
                        book,
                        11,
                        "Who Stole the Tarts?",
                        """
                        Alice arrived at a courtroom where the Knave of Hearts
                        was accused of stealing the Queen's tarts.

                        The King and Queen were presiding over the trial.

                        Witnesses were called, evidence was presented,
                        and the proceedings became increasingly ridiculous.

                        Alice began to realize that the entire court was operating
                        according to rules that made no sense.
                        """
                );

                addChapter(
                        chapterRepository,
                        book,
                        12,
                        "Alice's Evidence",
                        """
                        Alice was called to give evidence.

                        By now she had grown considerably more confident.

                        The courtroom became more chaotic as the King,
                        Queen, and other characters argued.

                        Alice finally stood up to the nonsense around her.

                        She realized that the creatures of Wonderland
                        were not nearly as powerful or frightening as they seemed.

                        Then everything suddenly changed.

                        Alice woke up beside her sister on the river bank,
                        realizing that the extraordinary adventure had been a dream.
                        """
                );

                System.out.println(
                        "✓ 12 demo chapters created."
                );

            } else {

                System.out.println(
                        "✓ Demo chapters already exist."
                );
            }
        };
    }


    // =============================================================
    // HELPER METHOD
    // =============================================================

    private void addChapter(
            BookChapterRepository chapterRepository,
            Book book,
            int chapterNumber,
            String title,
            String content
    ) {

        BookChapter chapter = new BookChapter();

        chapter.setBook(book);
        chapter.setChapterNumber(chapterNumber);
        chapter.setTitle(title);
        chapter.setContent(content);

        chapterRepository.save(chapter);
    }
}