import { ButtonHTMLAttributes, PropsWithChildren } from 'preact/compat'

export default function Button(props: PropsWithChildren<ButtonHTMLAttributes>) {
  return (
    <button
      {...props}
      class={`w-full py-3 fw-bold text-white text-xl rounded-lg shadow transition duration-300 flex justify-center gap-2 items-center ${props.class}`}
    >
      { props.children }
    </button>
  )
}
