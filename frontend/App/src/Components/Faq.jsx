
import React, { useState } from 'react';

const Faq = () => {
    const [faq, setFaq] = useState([
        {
            question: 'How do I submit a review for a product?',
            answer: 'To leave a review, navigate to the specific product page and scroll down to the "Customer Reviews" section. Click on the "Write a Review" button. You will be asked to select a star rating (1 to 5), write a headline, and provide details about your experience. Once you are finished, click "Submit." Note that you may need to be logged into your account to post.',
            open: false
        },
        {
            question: 'Can I review a product if I didn\'t buy it from your website?',
            answer: 'Yes, you may review products you own even if you purchased them elsewhere. However, your review will not carry the "Verified Purchase" badge. This allows us to gather a wide range of feedback while maintaining transparency about the source of the review.',
            open: false
        },
        {
            question: 'Will my personal information be visible to the public?',
            answer: 'No. Your email address and phone number are kept private. Only your Public Display Name (which you can customize in your profile settings) will be shown next to your review.',
            open: false
        },
        {
            question: 'Can I include photos in my review?',
            answer: 'Absolutely. We encourage visual feedback as it helps other shoppers make informed decisions. When writing your review, click the "Add Photo" button to upload media from your device. Please ensure the images are clear and relate directly to the product.',
            open: false
        }
    ]);

    const toggleFaq = (index) => {
        setFaq(faq.map((item, i) => {
            if (i === index) {
                item.open = !item.open;
            } else {
                item.open = false;
            }

            return item;
        }));
    }

    return (
        <section className="py-10 bg-gray-50 sm:py-16 lg:py-24">
            <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
                    <p className="max-w-xl mx-auto mt-4 text-base leading-relaxed text-gray-600"></p>
                </div>

                <div className="max-w-3xl mx-auto mt-8 space-y-4 md:mt-16 ">
                    {faq.map((item, index) => (
                        <div key={index} className="transition-all duration-200 bg-white border border-gray-200 cursor-pointer hover:bg-gray-50">
                            <button type="button" className="flex items-center justify-between w-full px-4 py-5 sm:p-6" onClick={() => toggleFaq(index)}>
                                <span className="flex text-lg font-semibold text-black"> {item.question} </span>

                                <svg className={`w-6 h-6 text-gray-400 ${item.open ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div className={`${item.open ? 'block' : 'hidden'} px-4 pb-5 sm:px-6 sm:pb-6`}>
                                <p dangerouslySetInnerHTML={{ __html: item.answer }}></p>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-center text-gray-600 textbase mt-9">Didn’t find the answer you are looking for? <a href="#" title="" className="font-medium text-blue-600 transition-all duration-200 hover:text-blue-700 focus:text-blue-700 hover:underline">Contact our support</a></p>
            </div>
        </section>
    );
}

export default Faq;