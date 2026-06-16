import AsciiText from '@/components/demo/TextAnimations/AsciiText'

import React from 'react'

const page = () => {
    return (
        <div className='flex items-center justify-center'>
            {/* <TextFocus sentence='Text Focus' borderColor='#8727e2' blurAmount={4} /> */}
            <AsciiText text='Shivam' />
        </div>
    )
}

export default page