import React from 'react'

const GradientGrid = () => {
    return (
        <div className="grid grid-cols-8 grid-rows-8 gap-1.25">
            <div className="col-span-2 row-span-3 bg-gray-200 flex items-center justify-center">
                1
            </div>

            <div className="col-span-2 row-span-3 col-start-3 bg-gray-300 flex items-center justify-center">
                2
            </div>

            <div className="col-span-4 row-span-5 col-start-1 row-start-4 bg-gray-400 flex items-center justify-center">
                3
            </div>

            <div className="col-span-4 row-span-5 col-start-5 row-start-1 bg-gray-500 flex items-center justify-center">
                4
            </div>

            <div className="col-span-2 row-span-3 col-start-5 row-start-6 bg-gray-600 flex items-center justify-center">
                5
            </div>

            <div className="col-span-2 row-span-3 col-start-7 row-start-6 bg-gray-700 flex items-center justify-center">
                6
            </div>
        </div>
    );
}

export default GradientGrid