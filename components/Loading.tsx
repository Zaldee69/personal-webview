import React from 'react'
import Image from 'next/legacy/image';
import { assetPrefix } from 'next.config';

interface Props {
    title: string
}

const Loading = ({title} : Props) => {
  return (
    <div className="flex flex-col gap-2" >
        <Image alt='laoding' className="animate-spin" width="50" height="50" src={`${assetPrefix}/images/loader.svg`}  />
        <p className="text-center text-neutral50 poppins-regular" >{title}</p>
    </div>
  )
}

export default Loading