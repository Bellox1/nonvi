@php use App\Helpers\MarkdownHelper; @endphp

<div class="table">
{!! MarkdownHelper::parse($slot) !!}
</div>
