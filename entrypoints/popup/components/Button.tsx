import { ButtonHTMLAttributes, PropsWithChildren } from 'preact/compat'

export interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes> {
  icon?: string
}

export default function Button(props: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      class={[
        `group w-full px-2 py-3 bg-black text-left text-white text-lg rounded-lg`,
        `b-2 b-black shadow-lg transition duration-300 flex gap-2 items-center`,
        props.class
      ].join(' ')}
    >
      <div class={`${props.icon} text-4xl transition-[font-size] group-focus:text-5xl group-hover:text-5xl`}></div>
      <div class="flex flex-col line-height-normal">
        {props.children}
      </div>
    </button>
  )
}
