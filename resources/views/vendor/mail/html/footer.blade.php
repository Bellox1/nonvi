@php use App\Helpers\MarkdownHelper; @endphp

<tr>
<td>
<table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="content-cell" align="center">
{!! MarkdownHelper::parse($slot) !!}
</td>
</tr>
</table>
</td>
</tr>
