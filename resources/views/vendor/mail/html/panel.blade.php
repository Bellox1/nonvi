@php use App\Helpers\MarkdownHelper; @endphp

<table class="subcopy" width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td>
{!! MarkdownHelper::parse($slot) !!}
</td>
</tr>
</table>
