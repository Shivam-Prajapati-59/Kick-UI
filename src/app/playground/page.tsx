import TextFocus from '@/components/demo/TextAnimations/TextFocus'
import React from 'react'

const page = () => {
    return (
        <div className='flex items-center justify-center'>
            <TextFocus sentence='Text Focus' borderColor='#8727e2' blurAmount={4} />
        </div>
    )
}

export default page