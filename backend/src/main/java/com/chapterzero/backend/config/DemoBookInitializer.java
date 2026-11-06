package com.chapterzero.backend.config;

import com.chapterzero.backend.entity.Book;
import com.chapterzero.backend.entity.BookChapter;
import com.chapterzero.backend.entity.ReadingStatus;
import com.chapterzero.backend.entity.UserBook;
import com.chapterzero.backend.repository.BookChapterRepository;
import com.chapterzero.backend.repository.BookRepository;
import com.chapterzero.backend.repository.UserBookRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DemoBookInitializer {

    private static final String BOOK_TITLE =
            "Alice's Adventures in Wonderland";

    @Bean
    CommandLineRunner insertDemoBook(
            BookRepository bookRepository,
            BookChapterRepository chapterRepository,
            UserBookRepository userBookRepository
    ) {

        return args -> {

            System.out.println();
            System.out.println(
                    "=============================================="
            );
            System.out.println(
                    "   CHAPTER ZERO — DEMO BOOK SETUP"
            );
            System.out.println(
                    "=============================================="
            );

            // =====================================================
            // FIND OR CREATE ALICE
            // =====================================================

            Book book = bookRepository
                    .findAll()
                    .stream()
                    .filter(existing ->
                            existing.getTitle() != null &&
                            existing.getTitle()
                                    .equalsIgnoreCase(
                                            BOOK_TITLE
                                    )
                    )
                    .findFirst()
                    .orElse(null);

            if (book == null) {

                book = new Book();

                book.setTitle(
                        BOOK_TITLE
                );

                book.setAuthor(
                        "Lewis Carroll"
                );

                book.setPublishedYear(
                        1865
                );

                book.setIsbn(
                        "9780486292737"
                );

                book.setCoverUrl(
                        "https://covers.openlibrary.org/b/isbn/9780486292737-L.jpg"
                );

                book.setDescription(
                        "Alice's Adventures in Wonderland follows "
                        + "Alice as she falls down a rabbit hole and "
                        + "enters a strange world filled with curious "
                        + "creatures, impossible logic, and unforgettable "
                        + "characters."
                );

                book = bookRepository.save(
                        book
                );

                System.out.println(
                        "✓ Alice created."
                );
            }

            final Book savedBook = book;

            // =====================================================
            // ADD TO PERSONAL LIBRARY
            // =====================================================

            if (userBookRepository.findAll().stream().noneMatch(
                    existing -> existing.getBook() != null
                            && savedBook.getId().equals(existing.getBook().getId())
            )) {

                UserBook userBook =
                        new UserBook();

                userBook.setBook(
                        book
                );

                userBook.setStatus(
                        ReadingStatus.CURRENTLY_READING
                );

                userBook.setCurrentPage(
                        1
                );

                userBook.setTotalPages(
                        12
                );

                userBookRepository.save(
                        userBook
                );

                System.out.println(
                        "✓ Alice added to your library."
                );
            }

            // =====================================================
            // CHECK EXISTING CHAPTERS
            // =====================================================

            List<BookChapter> existingChapters =
                    chapterRepository
                            .findByBookIdOrderByChapterNumberAsc(
                                    book.getId()
                            );

            if (existingChapters.size() >= 12) {

                System.out.println(
                        "✓ 12 chapters already exist."
                );

                System.out.println(
                        "✓ Reading Room ready."
                );

                System.out.println(
                        "=============================================="
                );

                return;
            }

            // =====================================================
            // REMOVE OLD DEMO CHAPTERS
            // =====================================================

            if (!existingChapters.isEmpty()) {

                chapterRepository.deleteAll(
                        existingChapters
                );

                System.out.println(
                        "✓ Old demo chapters removed."
                );
            }

            // =====================================================
            // CHAPTER 1
            // =====================================================

            saveChapter(
                    chapterRepository,
                    book,
                    1,
                    "Down the Rabbit-Hole",
                    """
                    Alice was beginning to get very tired of sitting by
                    her sister on the bank, and of having nothing to do:
                    once or twice she had peeped into the book her sister
                    was reading, but it had no pictures or conversations
                    in it.

                    "And what is the use of a book," thought Alice
                    "without pictures or conversations?"

                    So she was considering in her own mind whether the
                    pleasure of making a daisy-chain would be worth the
                    trouble of getting up and picking the daisies, when
                    suddenly a White Rabbit with pink eyes ran close by her.

                    There was nothing so very remarkable in that; nor did
                    Alice think it so very much out of the way to hear the
                    Rabbit say to itself, "Oh dear! Oh dear! I shall be late!"

                    But when the Rabbit actually took a watch out of its
                    waistcoat-pocket, and looked at it, and then hurried on,
                    Alice started to her feet.

                    It flashed across her mind that she had never before
                    seen a rabbit with either a waistcoat-pocket, or a watch
                    to take out of it.

                    Burning with curiosity, she ran across the field after
                    it, and fortunately was just in time to see it pop down
                    a large rabbit-hole under the hedge.

                    In another moment down went Alice after it, never once
                    considering how in the world she was to get out again.

                    The rabbit-hole went straight on like a tunnel for some
                    way, and then dipped suddenly down.

                    Down, down, down she went.

                    Would the fall never come to an end?
                    """
            );

            // =====================================================
            // CHAPTER 2
            // =====================================================

            saveChapter(
                    chapterRepository,
                    book,
                    2,
                    "The Pool of Tears",
                    """
                    "Curiouser and curiouser!" cried Alice.

                    She was so much surprised that for the moment she quite
                    forgot how to speak good English.

                    "Now I'm opening out like the largest telescope that
                    ever was! Good-bye, feet!"

                    For when she looked down at her feet, they seemed to be
                    almost out of sight, they were getting so far off.

                    Alice began to wonder who would put on her shoes and
                    stockings for her now.

                    She looked down again and noticed that she was growing
                    smaller and smaller.

                    After a while she found herself beside a little pool.

                    "Oh dear! What a strange day this is becoming."

                    Alice looked around and noticed that the pool was
                    getting quite crowded with birds and animals that had
                    fallen into it.

                    There were a Duck and a Dodo, a Lory and an Eaglet,
                    and several other curious creatures.

                    At last the Dodo solemnly announced that the best thing
                    to get them dry would be a Caucus-race.
                    """
            );

            // =====================================================
            // CHAPTER 3
            // =====================================================

            saveChapter(
                    chapterRepository,
                    book,
                    3,
                    "A Caucus-Race and a Long Tale",
                    """
                    They were just beginning to get settled down again,
                    and were very nearly getting dry again, when suddenly
                    there came a great shouting of "Dinah my dear! Dinah
                    my dear! Oh where is she, darling?"

                    Alice began to talk to herself, as usual, for she
                    thought there was nobody else to listen.

                    "Dinah'll miss me very much to-night, I should think!"

                    The Dodo solemnly announced that the best thing to get
                    them dry would be a Caucus-race.

                    "What is a Caucus-race?" said Alice.

                    "Why," said the Dodo, "the best way to explain it is
                    to do it."

                    So it began.

                    Alice thought the whole thing was very curious.

                    Nobody seemed to know exactly when the race was over.

                    At last the Dodo called out, "Everybody has won, and
                    all must have prizes."

                    Alice had to give everybody a prize, and the Dodo
                    solemnly presented her with a thimble.
                    """
            );

            // =====================================================
            // CHAPTER 4
            // =====================================================

            saveChapter(
                    chapterRepository,
                    book,
                    4,
                    "The Rabbit Sends in a Little Bill",
                    """
                    It was the White Rabbit, trotting slowly back again,
                    and he was looking anxiously about as if he had lost
                    something.

                    Alice guessed in a moment that it was looking for the
                    fan and the two large white kid gloves.

                    "Mary Ann! Mary Ann!" said the Rabbit.

                    "I'll soon make you grow larger again!"

                    Alice was so frightened that she forgot for the moment
                    how large she had grown.

                    The Rabbit heard her and called out angrily:

                    "Mary Ann! What are you doing out here? Run home this
                    moment, and fetch me a pair of gloves and a fan!"

                    Alice was glad to be out of the way.

                    She ran into a little garden, and there she found
                    another strange adventure waiting for her.

                    Everything in Wonderland seemed to change whenever she
                    thought she understood it.
                    """
            );

            // =====================================================
            // CHAPTER 5
            // =====================================================

            saveChapter(
                    chapterRepository,
                    book,
                    5,
                    "Advice from a Caterpillar",
                    """
                    The Caterpillar and Alice looked at each other for
                    some time in silence.

                    At last the Caterpillar took the hookah out of its
                    mouth, and addressed her in a languid, sleepy voice.

                    "Who are YOU?" said the Caterpillar.

                    This was not an encouraging opening for a conversation.

                    Alice replied, rather shyly, "I—I hardly know, Sir,
                    just at present—at least I know who I WAS when I got up
                    this morning, but I think I must have been changed
                    several times since then."

                    "What do you mean by that?" said the Caterpillar
                    sternly.

                    "Explain yourself!"

                    "I can't explain MYSELF, I'm afraid, Sir," said Alice,
                    "because I'm not myself, you see."

                    "I don't see," said the Caterpillar.

                    Alice was silent.

                    The Caterpillar asked her which size she would like
                    to be.

                    "I'm not particular as to size," she hastily replied.

                    "One side will make you grow taller, and the other
                    side will make you grow shorter."
                    """
            );

            // =====================================================
            // CHAPTER 6
            // =====================================================

            saveChapter(
                    chapterRepository,
                    book,
                    6,
                    "Pig and Pepper",
                    """
                    For a minute or two Alice stood silent, looking at the
                    house, wondering what to do next.

                    Suddenly a Fish-Footman came running out of the wood.

                    Alice watched him carefully.

                    Everything in Wonderland seemed to have its own rules,
                    although nobody ever explained what those rules were.

                    The Duchess's cook was busily preparing pepper soup.

                    There was certainly too much pepper in it.

                    Alice sneezed.

                    The baby sneezed.

                    Even the Duchess sneezed from time to time.

                    "If everybody minded their own business," the Duchess
                    said, "the world would go round a deal faster than it
                    does."

                    Alice did not think this was a very good reason.

                    Soon the Duchess handed Alice the baby and disappeared.

                    Alice carried the child outside.

                    Then something very curious happened.

                    The baby began to change.
                    """
            );

            // =====================================================
            // CHAPTER 7
            // =====================================================

            saveChapter(
                    chapterRepository,
                    book,
                    7,
                    "A Mad Tea-Party",
                    """
                    There was a large table set out under a tree in front
                    of the house, and the March Hare and the Hatter were
                    having tea at it.

                    A Dormouse was sitting between them, fast asleep.

                    Alice was not particularly surprised at this.

                    "No room! No room!" they cried out when they saw her.

                    "There's PLENTY of room!" said Alice indignantly, and
                    she sat down in a large arm-chair at one end of the
                    table.

                    "Have some wine," the March Hare said.

                    "I don't see any," said Alice.

                    "There isn't any," said the March Hare.

                    "Then it wasn't very civil of you to offer it," said
                    Alice angrily.

                    "It wasn't very civil of you to sit down without
                    being invited," said the March Hare.

                    The Hatter opened his eyes very wide.

                    "Why is a raven like a writing-desk?"

                    Alice felt that this was an extraordinary question.

                    "I haven't the slightest idea," she said.

                    "Nor I," said the Hatter.

                    The table was crowded with tea things, and the
                    conversation became stranger and stranger.
                    """
            );

            // =====================================================
            // CHAPTER 8
            // =====================================================

            saveChapter(
                    chapterRepository,
                    book,
                    8,
                    "The Queen's Croquet-Ground",
                    """
                    A large rose-tree stood near the entrance of the
                    garden.

                    The roses growing on it were white, but three gardeners
                    were busily painting them red.

                    Alice thought this very curious.

                    She went up to the gardeners and listened.

                    "Would you tell me," said Alice, "why you are painting
                    those roses?"

                    "Well, the fact is, you see, Miss," said Number Two,
                    "we were trying to get the wrong sort of rose-tree."

                    The Queen's procession appeared.

                    Alice recognized the Queen at once.

                    She was followed by the King and a great number of
                    royal guests.

                    "Off with their heads!" the Queen shouted whenever
                    anything displeased her.

                    Alice began to wonder whether anyone in Wonderland
                    actually had a head left by the end of the day.

                    Soon the croquet-ground became a very strange place.

                    The balls were live hedgehogs.

                    The mallets were flamingoes.

                    The hoops were soldiers.

                    Alice found the whole game extremely difficult.
                    """
            );

            // =====================================================
            // CHAPTER 9
            // =====================================================

            saveChapter(
                    chapterRepository,
                    book,
                    9,
                    "The Mock Turtle's Story",
                    """
                    "You can't think how glad I am to see you again, you
                    dear old thing!" said the Duchess.

                    Alice was very glad to find her in such a pleasant
                    temper.

                    The Queen was sitting on a large throne.

                    Alice listened as the Mock Turtle began telling his
                    story.

                    "We had the best of educations—in fact, we went to
                    school every day."

                    "I've only been to one school in Wonderland," said
                    Alice.

                    "And what did you learn there?"

                    "Reeling and Writhing, of course, to begin with," the
                    Mock Turtle replied.

                    "And then the different branches of Arithmetic—
                    Ambition, Distraction, Uglification, and Derision."

                    Alice was beginning to think that Wonderland schools
                    were very different from schools at home.

                    The Mock Turtle continued his tale with great
                    enthusiasm.

                    Everything he described seemed almost familiar and yet
                    completely impossible.
                    """
            );

            // =====================================================
            // CHAPTER 10
            // =====================================================

            saveChapter(
                    chapterRepository,
                    book,
                    10,
                    "The Lobster Quadrille",
                    """
                    "You may not have lived much under the sea," said the
                    Mock Turtle, "and perhaps you were never even introduced
                    to a lobster."

                    Alice began to imagine the Lobster Quadrille.

                    "Would you like to see a little of it?" said the Mock
                    Turtle.

                    "Very much indeed," said Alice.

                    "Come, let's try the first figure!"

                    Alice was fascinated.

                    The dance was unlike anything she had ever seen.

                    The Lobster Quadrille seemed to combine dancing,
                    jumping, throwing, and singing all at once.

                    "I'll tell you how it is done," said the Mock Turtle.

                    "You advance twice, set to partners—change lobsters,
                    and retire in same order."

                    Alice tried to imagine what this would look like.

                    "It sounds rather hard," she said.

                    "It's more fun to do than to explain," said the Mock
                    Turtle.
                    """
            );

            // =====================================================
            // CHAPTER 11
            // =====================================================

            saveChapter(
                    chapterRepository,
                    book,
                    11,
                    "Who Stole the Tarts?",
                    """
                    The King and Queen of Hearts were seated on their
                    throne when Alice entered the great courtroom.

                    A great crowd had gathered.

                    The Knave of Hearts stood before them.

                    The White Rabbit was beside the King.

                    "Herald, read the accusation!" cried the King.

                    The White Rabbit unrolled a large piece of parchment.

                    "The Queen of Hearts, she made some tarts, all on a
                    summer day."

                    Alice listened carefully.

                    The trial seemed to be about who had stolen the
                    Queen's tarts.

                    One witness after another was called.

                    The whole court became more absurd with every question.

                    Alice was beginning to grow larger again.

                    She could feel that something important was about to
                    happen.

                    The King demanded silence.

                    But Alice was no longer as frightened as she had been
                    before.

                    Wonderland was beginning to seem less mysterious.
                    """
            );

            // =====================================================
            // CHAPTER 12
            // =====================================================

            saveChapter(
                    chapterRepository,
                    book,
                    12,
                    "Alice's Evidence",
                    """
                    "Here!" cried Alice, quite forgetting in the flurry of
                    the moment how large she had grown in the last few
                    minutes.

                    "Who cares for you? You're nothing but a pack of cards!"

                    At this the whole pack rose into the air and came
                    flying down upon her.

                    Alice screamed.

                    She tried to brush them away.

                    Suddenly she found herself lying on the bank, with
                    her head in the lap of her sister, who was gently
                    brushing away some leaves that had fluttered down from
                    the trees.

                    "Wake up, Alice dear!" said her sister.

                    Alice opened her eyes.

                    She remembered the strange world she had visited.

                    The White Rabbit.

                    The Caterpillar.

                    The Mad Hatter.

                    The Queen of Hearts.

                    Everything seemed to have happened in a dream.

                    Alice began telling her sister about Wonderland.

                    Her sister listened patiently.

                    Alice knew that the adventure would stay with her for
                    a very long time.

                    And perhaps, someday, she would dream of Wonderland
                    again.
                    """
            );

            System.out.println();
            System.out.println(
                    "=============================================="
            );
            System.out.println(
                    "   ✓ CHAPTER ZERO DEMO BOOK READY"
            );
            System.out.println(
                    "   ✓ Alice's Adventures in Wonderland"
            );
            System.out.println(
                    "   ✓ 12 readable chapters"
            );
            System.out.println(
                    "   ✓ Reading Room ready"
            );
            System.out.println(
                    "=============================================="
            );
        };
    }

    // =========================================================
    // SAVE CHAPTER
    // =========================================================

    private void saveChapter(
            BookChapterRepository repository,
            Book book,
            int number,
            String title,
            String content
    ) {

        BookChapter chapter =
                new BookChapter();

        chapter.setBook(
                book
        );

        chapter.setChapterNumber(
                number
        );

        chapter.setTitle(
                title
        );

        chapter.setContent(
                content.trim()
        );

        repository.save(
                chapter
        );

        System.out.println(
                "✓ Chapter "
                        + number
                        + " saved: "
                        + title
        );
    }
}