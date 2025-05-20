@php use App\Helpers\MarkdownHelper; @endphp

{!! MarkdownHelper::strip($header ?? '') !!}
{!! MarkdownHelper::strip($slot) !!}

@isset($subcopy)
{!! MarkdownHelper::strip($subcopy) !!}
@endisset

{!! MarkdownHelper::strip($footer ?? '') !!}
